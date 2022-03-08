module Main exposing (..)
import Browser
import Browser.Navigation as Nav
import Url
import Url.Parser as UrlP exposing (Parser, (</>))
import Html exposing (
    Html, button, div,
    text, ul, li,
    h1, h2, h3,
    a, header, pre,
    label, input, nav,
    p
  )
import Html.Events exposing (onClick, onCheck)
import Http
import Html.Attributes exposing (class, id, href, target, type_, for)
import Json.Decode as Decode
import Markdown exposing (toHtml)

main : Program () Model Msg
main =
  Browser.application {
    init = init,
    view = view,
    update = update,
    subscriptions = subscriptions,
    onUrlChange = UrlChanged,
    onUrlRequest = LinkClicked
  }

init : () -> Url.Url -> Nav.Key -> (Model, Cmd Msg)
init flags url key =
  (Model key url Loading "dark", getPostsLanding)

type alias Post = {
    id : String,
    title : String,
    subtitle : String,
    body : String,
    date : String
  }

type alias Model = {
    key : Nav.Key,
    url : Url.Url,
    state : State,
    theme : String
  }

type State
  = Loading
  | Failure (List Post)
  | SuccessLanding (List Post)
  | SuccessPost Post

type Route
  = HomeRoute
  | PostsRoute
  | PostsLandingRoute
  | PostRoute String
  | NotFoundRoute

type Msg
  = GotPostsLanding (Result Http.Error String)
  | GotPosts (Result Http.Error String)
  | GotPost (Result Http.Error String)
  | LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url
  | ChangeTheme

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotPostsLanding res ->
      ({ model | state = (parsePostsResult res) }, Cmd.none)
    GotPosts res ->
      ({ model | state = (parsePostsResult res) }, Cmd.none)
    GotPost res ->
      ({ model | state = (parsePostResult res) }, Cmd.none)
    LinkClicked urlRequest ->
      case urlRequest of
        Browser.Internal url ->
          (model, Nav.pushUrl model.key (Url.toString url))
        Browser.External href ->
          (model, Nav.load href)
    UrlChanged url ->
      case fromUrl url of
        HomeRoute ->
          ({ model | url = url }, getPostsLanding)
        PostsRoute ->
          ({ model | url = url }, getPosts)
        PostsLandingRoute ->
          ({ model | url = url }, getPostsLanding)
        PostRoute post ->
          ({ model | url = url }, getPost post)
        NotFoundRoute ->
          ({ model | url = url }, Cmd.none)
    ChangeTheme ->
      ({ model | theme = getNewTheme model.theme }, Cmd.none )

-- SUBSCRIPTIONS --

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- VIEW --

view : Model -> (Browser.Document Msg)
view model = {
  title = "Simon Jones",
  body = [
    makeThemeSwitch,
    div [ class "container1" ] (
      case model.state of
        Loading -> [
          header [ id "page-title" ] [
            h1 [] [ text "Loading..." ]
            ]
          ]
        Failure errorInfo -> [
            header [ id "page-title" ] [
              h1 [] [ text "Oops..." ]
            ],
            div [ class "container2" ] (displayError errorInfo)
          ]
        SuccessLanding posts -> [
            header [ id "page-title" ] [
              h1 [] [ text "Simon Jones" ]
            ],
            div [ class "container2" ] (displayPosts posts)
          ]
        SuccessPost post -> [
            header [ id "page-title" ] [
              h1 [] [ text post.title ]
            ],
            displayPost post
          ]
    )]
  }

-- HELPERS --

  -- GETTING --

getApiBaseUrl : String
getApiBaseUrl =
  -- "http://localhost:4000"
  "http://api.simonjjones.com"

getPosts : Cmd Msg
getPosts =
  Http.get {
    url = getApiBaseUrl ++ "/posts",
    expect = Http.expectString GotPosts
  }

getPostsLanding : Cmd Msg
getPostsLanding =
  Http.get {
    url = getApiBaseUrl ++ "/postslanding",
    expect = Http.expectString GotPostsLanding
  }

getPost : String -> Cmd Msg
getPost post =
  Http.get {
    url = getApiBaseUrl ++ "/posts/" ++ post,
    expect = Http.expectString GotPost
  }

parseHttpError : Http.Error -> State
parseHttpError err =
  let
    baseErr = Post "" "Http Error!" "" "" ""
  in
    case err of
      Http.BadUrl s ->
        Failure [ { baseErr | body = s} ]
      Http.Timeout ->
        Failure [ { baseErr | body = "The request timed out. Try again."} ]
      Http.NetworkError ->
        Failure [ { baseErr | body = "Network Error."} ]
      Http.BadStatus i ->
        Failure [ { baseErr | body = "The server returned an error " ++ String.fromInt i ++ "."} ]
      Http.BadBody s ->
        Failure [ { baseErr | body = s} ]

parsePostsResult : (Result Http.Error String) -> State
parsePostsResult result =
  case result of
    Err err ->
      parseHttpError err
    Ok posts ->
      SuccessLanding (decodePosts posts)

parsePostResult : (Result Http.Error String) -> State
parsePostResult result =
  case result of
    Err err ->
      parseHttpError err
    Ok post ->
      SuccessPost (decodePost post)

  -- DECODING --

-- https://www.artificialworlds.net/blog/2018/10/19/elm-json-decoder-examples/
postDecoder : Decode.Decoder Post
postDecoder =
  Decode.map5 Post
    (Decode.field "id" Decode.string)
    (Decode.field "title" Decode.string)
    (Decode.field "subtitle" Decode.string)
    (Decode.field "body" Decode.string)
    (Decode.field "date" Decode.string)

postsDecoder : Decode.Decoder (List Post)
postsDecoder =
  Decode.list postDecoder

decodePosts : String -> (List Post)
decodePosts s =
    case Decode.decodeString postsDecoder s of
      Ok posts ->
        posts
      Err reason ->
        [Post "" "Error while decoding posts!" "" (Decode.errorToString reason) ""]

decodePost s =
  case Decode.decodeString postDecoder s of
    Ok posts ->
      posts
    Err reason ->
      Post "" "Error while decoding post!" "" (Decode.errorToString reason) ""

  -- HTML --

themes : List String
themes =
  ["dark", "cherry-blossom", "aqua", "cafe"]

makeThemeSwitch : Html Msg
makeThemeSwitch =
  nav [ id "topnav" ] [
    nav [ id "pagenav" ] [
      div [ class "theme-switch-wrapper" ] [
        label [ class "theme-switch", for "checkbox" ] [
          input [ onClick ChangeTheme, type_ "checkbox", id "checkbox" ] [],
          div [ class "slider round" ] []
        ]
      ]
    ]
  ]

getNewTheme : String -> String
getNewTheme current =
  let
    themeIndex = themes
      |> List.indexedMap Tuple.pair
      |> List.filter (\x -> (Tuple.second x) == current)
      |> List.head
      |> Maybe.withDefault (0, "")
      |> Tuple.first

    nOfThemes = themes
      |> List.length
  in
    case (themeIndex == nOfThemes) of
      True ->
        List.head themes
        |> Maybe.withDefault "dark"
      False ->
        themes
        |> List.indexedMap Tuple.pair
        |> List.filter (\x -> (Tuple.first x) == nOfThemes)
        |> List.head
        |> Maybe.withDefault (0, "dark")
        |> Tuple.second

displayPosts : List Post -> List (Html Msg)
displayPosts posts =
  posts
  |> List.map (\post ->
    a [ class "link-wrapper", href (makePostsRoute post.id) ] [
      div [ class "round-box clickable" ] [
        h1 [ class "card-title" ] [ text (post.title) ],
        p [] [ text (post.subtitle) ],
        makePostBody post.body,
        p [ class "time-stamp" ] [ text (post.date) ]
      ]
    ]
  )

displayPost : Post -> Html msg
displayPost post =
  div [ class "article" ] [
    h3 [] [ text post.subtitle ],
    p [ class "time-stamp" ] [ text post.date ],
    makePostBody post.body
  ]

makePostBody : String -> Html msg
makePostBody str =
  if String.length str > 0 then
    Markdown.toHtml [] str
    -- ul [] (
    --   str
    --   |> String.split "\n"
    --   |> List.map (\line ->
    --     li [] [
    --       if String.length line > 0 then
    --         text line
    --       else
    --         p [] []
    --     ]
    --   )
    -- )
  else
    text ""

displayError : List Post -> List (Html msg)
displayError errorInfo =
  errorInfo
  |> List.map (\error ->
    div [ class "round-box" ] [
      h1 [ class "card-title" ] [ text (error.title) ],
      pre [ class "error-msg" ] [
        error.body
        |> String.replace "\n" "\n"
        |> text
      ]
    ]
  )

  -- ROUTING --

fromUrl : Url.Url -> Route
fromUrl url =
  Maybe.withDefault NotFoundRoute (UrlP.parse routeParser url)

routeParser : UrlP.Parser (Route -> a) a
routeParser =
  UrlP.oneOf [
    UrlP.map HomeRoute (UrlP.top),
    UrlP.map PostsLandingRoute  (UrlP.s "postslanding"),
    UrlP.map PostRoute  (UrlP.s "posts" </> UrlP.string),
    UrlP.map PostsRoute (UrlP.s "posts")
  ]

makePostsRoute : String -> String
makePostsRoute str =
  String.join "" [ "/posts/", str ]
