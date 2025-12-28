import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Conversation {
    id: string;
}


const conversationPrioritySlice = createSlice({
    name: 'conversationPriority',
    initialState: [] as Conversation[],
    reducers: {
        setConversationPriority(state, action: PayloadAction<Conversation[]>) {
            return action.payload;
        },
        shiftConversationToTop(state, action: PayloadAction<Conversation>) {
            const index = state.findIndex(convo => convo.id === action.payload.id);
            if (index > -1) {
                const [convo] = state.splice(index, 1);
                state.unshift(convo);
            }else{
                state.unshift(action.payload);
            }
        },
    },
        
})