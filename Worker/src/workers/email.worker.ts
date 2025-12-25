import { connectToRabbitMQ } from './../lib/rabbitMQ';
console.log("✅email worker running because");

const email = () => {
    connectToRabbitMQ();
    console.log("ahad patwary");
}

email();