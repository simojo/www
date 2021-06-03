module TicTacToe exposing (..)
import Html exposing (Html)

type alias BoardData = {
    a1: String, a2: String, a3: String,
    b1: String, b2: String, b3: String,
    c1: String, c2: String, c3: String
  }

drawBoardText : BoardData -> String
drawBoardText boardData =
  """
  a1 | a2 | a3 
  ---|---|---
  b1 | b2 | b3 
  ---|---|---
  c1 | c2 | c3 
  """
  |> String.replace "a1" boardData.a1
  |> String.replace "a2" boardData.a2
  |> String.replace "a3" boardData.a3
  |> String.replace "b1" boardData.b1
  |> String.replace "b2" boardData.b2
  |> String.replace "b3" boardData.b3
  |> String.replace "c1" boardData.c1
  |> String.replace "c2" boardData.c2
  |> String.replace "c3" boardData.c3
