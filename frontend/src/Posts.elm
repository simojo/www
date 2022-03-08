module Posts exposing (..)
import Main exposing (..)
import Url
import Url.Parser as UrlP exposing (Parser, (</>))
import Json.Decode as Decode
import Html exposing (
    Html, button, div,
    text, ul, li,
    h1, h2, h3,
    a, header, pre,
    label, input, nav,
    p
  )
import Html.Attributes exposing (class, id, href, target, type_, for)

type alias Post = {
    id : String,
    title : String,
    subtitle : String,
    body : String,
    date : String
  }

-- HTML --

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
    ul [] (
      str
      |> String.split "\n"
      |> List.map (\line ->
        li [] [
          if String.length line > 0 then
            text line
          else
            p [] []
        ]
      )
    )
  else
    text ""

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
