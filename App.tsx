import { NavigationContainer } from "@react-navigation/native";
import MyTabs from "./src/navigation/BottomTabs";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import React from "react";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    </Provider>
  );
}
