module Command exposing (lineFromCommand, completeCommand)
import Types exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)

-- COMMANDS INDEX --

commands : List Command
commands = [
    Command "clear"
      "Clears the screen"
      "clear"
      []
      Clear,
    Command "echo"
      "Outputs input text"
      "echo hello there!"
      []
      Echo,
    Command "exit"
      "Tries to exit, but fails."
      "exit"
      []
      Exit,
    Command "help"
      "Displays help about a command."
      "help echo"
      []
      Help,
    Command "start"
      "Displays startup text."
      "start"
      []
      Start
  ]

handleCommand : CommandMsg -> Model -> Model
handleCommand cmd model =
  case cmd of
    Clear ->
      clear model
    Echo str ->
      echo str model
    Exit ->
      exit model
    Help thisCmd ->
      help thisCmd model
    Start ->
      start model

-- COMMAND FUNCTIONS --

clear : Model -> Model
clear model =
  { model | history = [] }

echo : String -> Model -> Model
echo str model =
  { model | history =
    outputOk <| text <| str
    :: model.history
  }

exit : Model -> Model
exit model =
  { model | history =
    outputErr <| text "Sorry, you can't really do that here."
    :: model.history
  }

help : (Maybe String) -> Model -> Model
help cmd model =
  case cmd of
    Just cmdStr ->
      commands
        |> List.filter (\x -> x.name == cmdStr)
        |> List.head
        |> (\x ->
          case x of
            Nothing ->
              outputErr <| text ("Command " ++ cmd ++ " not found.")
            Just thisCommand ->
              outputOk <| div [ class "help" ] [
                h1 [] [ text ("--- " ++ thisCommand.name ++ " ---") ],
                p [] [ text thisCommand.desc ],
                h2 [] [ text "USAGE" ],
                p [] [ text thisCommand.usage ],
                case thisCommand.args of
                  [] ->
                    text ""
                  _ ->
                    h2 [] [ text "ARGUMENTS" ],
                    p [] [ text <| String.join "\n" thisCommand.args ]
              ]
        )
    _ ->
      Ok <| div [ class "container" ] (
        commands
        |> List.map (\thisCommand ->
          div [ class "help" ] [
          h1 [] [ text ("--- " ++ thisCommand.name ++ " ---") ],
          p [] [ text thisCommand.desc ],
          h2 [] [ text "USAGE" ],
          p [] [ text thisCommand.usage ],
          case thisCommand.args of
            [] ->
              text ""
            _ ->
              h2 [] [ text "ARGUMENTS" ],
              p [] [ text <| String.join "\n" thisCommand.args ]
          ]
        )
      )

start : Model -> Model
start model =
  { model | history =
    outputOk <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help."
    :: model.history
  }

-- ######## --

lineFromCommand : String -> Line
lineFromCommand commandBody =
  let
    args =
      commandBody
      |> String.split " "
      |> List.tail
      |> Maybe.withDefault []
    strThisCommand =
      commandBody
      |> String.split " "
      |> List.head
      |> Maybe.withDefault ""
  in
  commands
  |> List.filter (\x -> x.name == strThisCommand)
  |> List.head
  |> Maybe.withDefault (noOpCommand strThisCommand)
  |> (\x -> x.receiver args)
  |> (\x -> Line commandBody x)

completeCommand : String -> String
completeCommand input =
  commands
  |> List.filter (\x ->
    String.startsWith input x.name
  )
  |> List.map (\x -> x.name)
  |> List.head
  |> Maybe.withDefault (
    commands
    |> List.map (\x ->
      input
      |> String.toList
      |> List.filter (\c -> String.contains (String.fromChar c) x.name)
      |> List.length
      |> (\i -> {
        matches = i,
        command = x
      })
    )
    |> List.filter (\x -> x.matches > 0)
    |> List.sortBy .matches
    |> List.reverse
    |> List.map (\x -> x.command.name)
    |> List.head
    |> Maybe.withDefault input
  )

-- HELPERS --

outputOk : Html Msg -> Line
outputOk html =
  (Line <| Output <| Ok <| html)

outputErr : Html Msg -> Line
outputErr html =
  (Line <| Output <| Err <| html)
