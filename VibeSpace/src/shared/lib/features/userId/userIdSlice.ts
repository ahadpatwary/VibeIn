import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  userId: '' // প্রাথমিকভাবে খালি স্ট্রিং রাখা হয়েছে
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // এখানে আপডেট করার জন্য রিডিউসার যোগ করতে পারেন যদি প্রয়োজন হয়
    addUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    }
  }
  // reducers খালি, কারণ update দরকার নেই
});


export const { addUserId } = userSlice.actions

export default userSlice.reducer;