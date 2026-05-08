import { configureStore } from '@reduxjs/toolkit';
import accessTokenReducer from '@/shared/lib/features/accessToken/accessTokenSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      accessToken: accessTokenReducer,  
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];


// import React from 'react'
// import type { RootState } from '../../app/store'
// import { useSelector, useDispatch } from 'react-redux'
// import { decrement, increment } from './counterSlice'

// export function Counter() {
//   const count = useSelector((state: RootState) => state.counter.value)
//   const dispatch = useDispatch()

//   return (
//     <div>
//       <div>
//         <button
//           aria-label="Increment value"
//           onClick={() => dispatch(increment())}
//         >
//           Increment
//         </button>
//         <span>{count}</span>
//         <button
//           aria-label="Decrement value"
//           onClick={() => dispatch(decrement())}
//         >
//           Decrement
//         </button>
//       </div>
//     </div>
//   )
// }