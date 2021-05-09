module Main exposing (..)
import Browser
import Browser.Navigation as Nav
import Url
import Url.Parser as UrlP exposing (Parser, (</>))
import Html exposing (
    Html,
    a,
    button,
    div,
    h1,
    h2,
    h3,
    header,
    input,
    input,
    label,
    li,
    nav,
    p,
    pre,
    span,
    text,
    ul
  )
import Html.Events exposing (
    onClick,
    onCheck,
    onInput
  )
import Http
import Html.Attributes exposing (..)
import Json.Decode as Decode

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
  (Model key url ["Welcome!"], Cmd.none)

type alias Line = {
    text : String
  }

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
    lines : List String
  }

type Msg
  = Command String
  | LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Command command ->
      ({ model | lines = (lineFromCommand command) ++ model.lines }, Cmd.none)
    LinkClicked urlRequest ->
      case urlRequest of
        Browser.Internal url ->
          (model, Nav.pushUrl model.key (Url.toString url))
        Browser.External href ->
          (model, Nav.load href)
    UrlChanged url ->
      (model, Cmd.none)

-- SUBSCRIPTIONS --

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- VIEW --

view : Model -> (Browser.Document Msg)
view model = {
    title = "Terminal",
    body = [
      div [ class "console" ] [
        ul [] (
          List.reverse (promptLine :: (displayLines model.lines))
        )
      ]
    ]
  }

-- HELPERS --

displayLines : List String -> List (Html Msg)
displayLines lines =
  lines
  |> List.map (\line ->
    li [] [
      prompt,
      text line
    ]
  )

lineFromCommand : String -> List String
lineFromCommand command = [
    (case String.split " " command of
      [] ->
        ""
      "l" :: [] ->
        "Nothing to see here."
      c :: _ ->
        "You pressed " ++ c
    ), command
  ]


prompt : Html Msg
prompt =
  span [ class "prompt" ] [ text "you@here - " ]

promptLine : Html Msg
promptLine =
  li [] [
    div [ class "prompt-line" ] [
      prompt,
      input [ onInput Command, placeholder ""] []
    ]
  ]
