declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        DBPATH: string;
        JWT_SECRET: string;
    }
}