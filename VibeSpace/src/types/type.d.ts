// import mongoose from 'mongoose'

declare global {
    var mongoose: {
        connection : Connection | null 
        promise : Promise<Connection> | null
    }
}

export {}