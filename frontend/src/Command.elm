module Command exposing (lineFromCommand, completeCommand)
import Types exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)

-- COMMANDS INDEX --

noOpCommand : Command
noOpCommand =
  Command ""
    ""
    ""
    []
    (\x -> Err <| text "")

commands : List Command
commands = [
    Command "echo"
      "Outputs input text"
      "echo hello there!"
      []
      echo,
    Command "exit"
      "Tries to exit, but fails."
      "exit"
      []
      exit,
    Command "help"
      "Displays help about a command."
      "help echo"
      []
      help,
    Command "start"
      "Displays startup text."
      "start"
      []
      start
  ]

-- COMMAND FUNCTIONS --

echo : List String -> Result (Html Msg) (Html Msg)
echo args =
  case args of
    s ->
      Ok <| text (String.join " " s)

exit : List String -> Result (Html Msg) (Html Msg)
exit args =
  case args of
    _ ->
      Err <| text "Sorry, you can't really do that here."

help : List String -> Result (Html Msg) (Html Msg)
help args =
  case args of
    cmd :: [] ->
      commands
        |> List.filter (\x -> x.name == cmd)
        |> List.head
        |> (\x ->
          case x of
            Nothing ->
              Err <| text ("Command " ++ cmd ++ " not found.")
            Just thisCommand ->
              Ok <| div [ class "help" ] [
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

start : List String -> Result (Html Msg) (Html Msg)
start args =
  case args of
    _ ->
      Ok <| text "Welcome to the terminal!\nType a command to get started."

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
  |> Maybe.withDefault noOpCommand
  |> (\x -> x.receiver args)
  |> (\x -> Line strThisCommand x)

completeCommand : String -> String
completeCommand input =
  commands
  |> List.filter (\x ->
    input
    |> String.toList
    |> List.filter (\c -> String.contains (String.fromChar c) x.name)
    |> List.length
    |> (\i -> i > 0)
  )
  |> List.map (\x -> x.name)
  |> List.head
  |> Maybe.withDefault input
