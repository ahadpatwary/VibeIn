import { connectToRabbitMQ } from './../lib/rabbitMQ';
console.log("✅email worker running because");

const email = () => {
    const { channel } = connectToRabbitMQ();
    console.log("ahad patwary");
}

email();