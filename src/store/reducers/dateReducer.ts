import { INCREASE_LIKES_BY_AMOUNT, INCREASE_LIKES_BY_ONE } from "../types"

const initialState = {
    totalLikes: 100,
    userName: "Ahmed"
}

export const dataReducer = (state = initialState, action) => {
    switch(action.type) {
        case INCREASE_LIKES_BY_ONE:
            return {...state, totalLikes: state.totalLikes + 1}
        
        case INCREASE_LIKES_BY_AMOUNT:
            return {...state, totalLikes: state.totalLikes + action.payload}

      default: 
        return state  
    }
}