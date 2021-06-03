module Command exposing (handleCommand, completeCommand)
import Types exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)

-- COMMANDS INDEX --

notFoundCommand : String -> Command
notFoundCommand cmd =
  Command ""
    ""
    ""
    []
    (\args model ->
      { model |
        history =
          outputErr (text <| cmd ++ ": command not found.")
          :: model.history
      })

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

clear : List String -> Model -> Model
clear _ model =
  { model | history = [] }

echo : List String -> Model -> Model
echo args model =
  let
    str = args |> String.join ""
  in
  { model | history =
    ( outputOk <| text <| str )
    :: model.history
  }

exit : List String -> Model -> Model
exit _ model =
  { model | history =
    ( outputErr <| text "Sorry, you can't really do that here." )
    :: model.history
  }

help : List String -> Model -> Model
help args model =
  { model |
    history =
      (case args of
        [] ->
          outputOk <| div [ class "container" ] (
            commands
            |> List.map (\thisCommand ->
              displayHelp thisCommand
            )
          )
        notEmpty ->
          let cmd = String.join "" notEmpty in
          commands
            |> List.filter (\x -> x.name == cmd)
            |> List.head
            |> (\x ->
              case x of
                Nothing ->
                  outputErr <| text ("command \"" ++ cmd ++ "\" not found.")
                Just thisCommand ->
                  outputOk <| displayHelp thisCommand
            )
      ) :: model.history
  }

start : List String -> Model -> Model
start _ model =
  { model | history =
    ( outputOk <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help." )
    :: model.history
  }

-- ######## --

handleCommand : String -> Model -> Model
handleCommand commandBody model =
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
    updatedModel =
      { model | history = Input commandBody :: model.history }
  in
    commands
    |> List.filter (\x -> x.name == strThisCommand)
    |> List.head
    |> Maybe.withDefault (notFoundCommand strThisCommand)
    |> (\x -> x.receiver args updatedModel)

completeCommand : String -> Model -> Model
completeCommand input model =
  commands
  |> List.filter (\x ->
    String.startsWith input x.name
  )
  |> List.map (\x -> x.name)
  |> (\list ->
    case list of
      [] ->
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
        |> (\x -> { model | current = x })
      one :: [] ->
        { model | current = one }
      many ->
        { model | belowprompt = Just <| ul [] (list |> List.map (\x -> li [] [ text x ])) }
  )

-- HELPERS --

outputOk : Html Msg -> Line
outputOk html =
  (Output <| Ok <| html)

outputErr : Html Msg -> Line
outputErr html =
  (Output <| Err <| html)

displayHelp : Command -> Html Msg
displayHelp thisCommand =
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
