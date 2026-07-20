import { RABBITMQ_CONFIG_CONSTANTS } from "../constants/mq.constants";
import { RabbitMQConfig, RequiredRabbitOpts } from "../types/mq.types";

export class RabbitMQConfigBuilder {
    private config: RabbitMQConfig;

    constructor(requiredOptions: RequiredRabbitOpts){
        this.config = {
            protocol: requiredOptions.protocol,
            hostname: requiredOptions.hostname, 
            port: requiredOptions.port,
            username: requiredOptions.username,
            password: requiredOptions.password,
        };
    }

    setHartbit(heartbit?: number): this { this.config.heartbeat = heartbit; return this; }
    setChannelMax(maxChannel?: number): this { this.config.channelMax = maxChannel; return this; }

    setNoDelay(delay?: boolean): this { this.config.noDelay = delay; return this; }
    setTimeout(timeMs?: number): this { this.config.timeout = timeMs; return this; }
    setKeepAlive(alive?: boolean): this { this.config.keepAlive = alive; return this; }
    setKeepAliveDelay(aliveDelayMs?: number): this { this.config.keepAliveDelay = aliveDelayMs; return this; }
    
    setInitialDelay(delayMs?: number): this { this.config.initialDelay = delayMs; return this; }
    setMaxDelay(delayMs?: number): this { this.config.maxDelay = delayMs; return this; }
    setFactor(factor?: number): this { this.config.factor = factor; return this; }
    setJitter(jitter?: number): this { this.config.jitter = jitter; return this; }
    maxRetries(retries?: number): this { this.config.maxRetries = retries; return this; }


    build(): Required<RabbitMQConfig>  {

        return {
    
            heartbeat: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_HEARTBEAT,
            channelMax: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_CHANNELMAX,
            
            noDelay: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_NO_DELAY,
            timeout: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_TIMEOUT,
            keepAlive: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_KEEP_ALIVE,
            keepAliveDelay: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_KEEP_ALIVE_DELAY,

            initialDelay: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_INITIAL_DELAY,
            maxDelay: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_MAX_DELAY,
            factor: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_FACTOR,
            jitter: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_JITTER,
            maxRetries: RABBITMQ_CONFIG_CONSTANTS.DEFAULT_MAX_RETRIES,

            ...this.config
        } ;
    }

}

export function createRabbitMQConfig(config: RabbitMQConfig ): Required<RabbitMQConfig> {
    const {
        channelMax,
        factor,
        heartbeat,
        hostname,
        initialDelay,
        jitter,
        keepAlive,
        keepAliveDelay,
        maxDelay,
        maxRetries,
        noDelay,
        password,
        port,
        protocol,
        timeout,
        username
    }: RabbitMQConfig = config;

    const requiredFields: Array<keyof RequiredRabbitOpts> = [
        'protocol', 'hostname', 'port', 'username', 'password'
    ];

    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Environment variable missing or invalid: ${field}`);
        }
    }

    const requiredOptions: RequiredRabbitOpts = {
        hostname,
        password,
        port,
        protocol,
        username
    }

    const builder = new RabbitMQConfigBuilder(requiredOptions)
        .setHartbit(heartbeat)
        .setChannelMax(channelMax)
        
        .setNoDelay(noDelay)
        .setTimeout(timeout)
        .setKeepAlive(keepAlive)
        .setKeepAliveDelay(keepAliveDelay)

        .setInitialDelay(initialDelay)
        .setMaxDelay(maxDelay)
        .setFactor(factor)
        .setJitter(jitter)
        .maxRetries(maxRetries)
    ;
        
    return builder.build();

} 