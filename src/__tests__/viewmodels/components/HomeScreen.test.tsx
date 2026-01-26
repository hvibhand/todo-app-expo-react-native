import React from "react";
import { ActivityIndicator } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../../../presentation/screens/HomeScreen";
import { useHomeViewModel } from "../../../presentation/viewmodels/HomeViewModel";

jest.mock("../../../presentation/viewmodels/HomeViewModel");

const mockUseHomeViewModel = useHomeViewModel as jest.MockedFunction<typeof useHomeViewModel>;

const baseTodos = [
  { id: "1", title: "Write tests", completed: false, createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", title: "Ship app", completed: true, createdAt: "2024-01-02T00:00:00Z" }
];

const setupMock = (overrides: Partial<ReturnType<typeof useHomeViewModel>> = {}) => {
  mockUseHomeViewModel.mockReturnValue({
    todos: baseTodos,
    loading: false,
    error: null,
    reload: jest.fn(),
    add: jest.fn().mockResolvedValue(undefined),
    edit: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    toggle: jest.fn().mockResolvedValue(undefined),
    ...overrides
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("shows loading state", () => {
  setupMock({ loading: true, todos: [] });
  const { UNSAFE_getByType } = render(<HomeScreen />);
  expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
});

test("shows error state", () => {
  setupMock({ error: "Boom", todos: [] });
  const { getByText } = render(<HomeScreen />);
  expect(getByText("Error: Boom")).toBeTruthy();
});

test("toggles search input", () => {
  setupMock();
  const { getByTestId, queryByTestId } = render(<HomeScreen />);

  fireEvent.press(getByTestId("search-btn"));
  expect(getByTestId("search-input")).toBeTruthy();

  fireEvent.press(getByTestId("close-search"));
  expect(queryByTestId("search-input")).toBeNull();
});

test("renders todos and calls handlers", async () => {
  setupMock();
  const { getByTestId, getByText, getByDisplayValue } = render(<HomeScreen />);
  const vm = mockUseHomeViewModel.mock.results[0].value;

  expect(getByText("Write tests")).toBeTruthy();
  expect(getByText("Ship app")).toBeTruthy();

  fireEvent.press(getByTestId("todo-1"));
  expect(vm.toggle).toHaveBeenCalledWith("1");

  fireEvent.press(getByTestId("delete-2"));
  expect(vm.remove).toHaveBeenCalledWith("2");

  fireEvent.press(getByTestId("edit-1"));
  await waitFor(() => expect(getByDisplayValue("Write tests")).toBeTruthy());
  fireEvent.changeText(getByTestId("edit-input"), "Updated title");
  fireEvent.press(getByTestId("save-edit"));
  expect(vm.edit).toHaveBeenCalledWith("1", "Updated title");
});

test("adds a todo via the add modal", () => {
  setupMock();
  const { getByTestId } = render(<HomeScreen />);
  const vm = mockUseHomeViewModel.mock.results[0].value;

  fireEvent.press(getByTestId("add-fab"));
  fireEvent.changeText(getByTestId("edit-input"), "New todo");
  fireEvent.press(getByTestId("save-edit"));

  expect(vm.add).toHaveBeenCalledWith("New todo");
});
