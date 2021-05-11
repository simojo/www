module Command exposing (lineFromCommand, completeCommand)
import Types exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)

-- COMMANDS INDEX --

noOpCommand : String -> Command
noOpCommand command =
  Command ""
    ""
    ""
    []
    (\x -> Err <| text <| "Command " ++ command ++ " not found.")

commands : List Command
commands = [
    Command "clear"
      "Clears the screen"
      "clear"
      []
      clear,
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

clear : List String -> Result (Html Msg) (Html Msg)
clear args =
  case args of
    _ -> Ok <| div [ class "clear" ] []

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
      Ok <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help."

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
    |> List.sortBy .matches
    |> List.reverse
    |> List.map (\x -> x.command.name)
    |> List.head
    |> Maybe.withDefault input
  )

