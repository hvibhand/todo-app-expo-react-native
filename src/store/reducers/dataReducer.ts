import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    totalLikes: 200
}

export const dataReducer = createSlice({
    name: "dataSlice",
    initialState: initialState,
    reducers:{
        increaseTotalLikesByOne: (state) => {
            state.totalLikes += 1
        },

        increaseTotalLikesByAmount: (state, action) => {
            state.totalLikes += action.payload
        }
    }
})

export const {increaseTotalLikesByOne, increaseTotalLikesByAmount} = dataReducer.actions