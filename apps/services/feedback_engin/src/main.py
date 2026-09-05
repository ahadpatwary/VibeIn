from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get('/')
async def root():
    return { "message": "server created successfully" }


@app.get('/posts')
async def posts():
    return {
        "message": "success",
        "status": 200,
        "posts": [
            {
                "id": 1,
                "name": "ahad patwary",
                "age": 30
            },
            {
                "id": 2, 
                "name": "abid patwary",
                "age": 15
            }
        ]
    }

def main():
    uvicorn.run(app, host = "localhost", port = 8000)


if __name__ == "__main__":
    main()


