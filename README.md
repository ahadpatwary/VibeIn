<!-- "workspaces": ["apps/*", "packages/*"]

npm i @myorg/redis-client -w apps/services/vibeinbackend

npm install @myorg/redis-client --workspace=apps/services/vibeinbackend


// apps/vibeinbackend/package.json
"dependencies": {
    "@nestjs/common": "^11.0.1",
    ...
    "@myorg/redis-client": "^0.1.0"
}


import CustomRedisClient from '@myorg/redis-client'; -->