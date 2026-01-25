import React from "react";
import HomeScreen from "../presentation/screens/HomeScreen";
import { render, waitFor, fireEvent } from "@testing-library/react-native";

jest.useFakeTimers();

test("HomeScreen renders todos from in-memory repo", async () => {
  const { getByText, getByTestId, queryByTestId } = render(<HomeScreen />);

  // wait for initial loading -> after async fake timeout
  await waitFor(() => expect(queryByTestId("todo-1")).toBeTruthy());
  expect(getByTestId("todo-1")).toBeTruthy();

  // toggle
  fireEvent.press(getByTestId("todo-1"));
  // todo toggled (optimistic)
  expect(getByTestId("todo-1")).toBeTruthy();
});