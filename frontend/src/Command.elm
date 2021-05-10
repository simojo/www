module Command exposing (Command, lineFromCommand)
import Html exposing (..)
import Main exposing (Line, Msg)

type alias Command = {
    name : String,
    desc : String,
    usage : String,
    args : List String,
    receiver : List String -> Html Msg
  }

type alias Argument = {
    name : String,
    desc : String
  }

-- COMMANDS INDEX --

commands : List Command
commands = [
    Command
      "echo"
      "Outputs input text"
      "echo hello there!"
      []
      echo,
    Command
      "exit"
      "Tries to exit, but fails."
      "exit"
      []
      exit,
    Command
      "help"
      "Displays help about a command."
      "help echo"
      []
      help,
    Command
      "start"
      "Displays startup text."
      "start"
      []
      start
  ]

-- COMMAND FUNCTIONS --

echo : List String -> Html Msg
echo args =
  case args of
    s ->
      text (String.join " " s)

exit : List String -> Html Msg
exit args =
  case args of
    _ ->
      text "Sorry, you can't really do that here."

help : List String -> Html Msg
help args =
  case args of
    cmd :: [] ->
      commands
        |> List.filter (\x -> x.name == cmd)
        |> List.head
        |> (\x ->
          case x of
            Nothing ->
              text ""
            Just thisCommand ->
              text thisCommand.desc
        )
    _ ->
      text "Welcome to the terminal!\nType a command to get started."

start : List String -> Html Msg
start args =
  case args of
    _ ->
      text "Welcome to the terminal!\nType a command to get started."

-- ######## --

lineFromCommand : String -> Line
lineFromCommand command =
  Line
    command
    (case String.split " " command of
      [] ->
        Ok ""
      "help" :: [] ->
        Ok "Welcome to the terminal!\nType a command to get started."

      "exit" :: [] ->
        Err "Sorry, you can't really do that here."

      "echo" :: str ->
        Ok (String.join "" str)

      "start" :: [] ->
        Ok "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help."

      char :: _ ->
        Err <| "Error: Command \"" ++ char ++ "\" not found."
    )
