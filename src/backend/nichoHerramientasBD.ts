import "dotenv/config";
import mongo from "mongodb";

const url = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "InnovaTechSolutions";

if (!url) {
    throw new Error("Falta la variable de entorno MONGODB_URI.");
}

const client = new mongo.MongoClient(url);

async function connection() {
    try {
        const connection = await client.connect();
        return connection.db(databaseName);
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}


export async function closeConnection() {
    await client.close();
}

if (process.argv[1]?.endsWith("nichoHerramientasBD.ts")) {
    connection()
        .then(() => {
            console.log(`Conexion exitosa a la base de datos ${databaseName}.`);
        })
        .catch(() => {
            process.exitCode = 1;
        })
        .finally(() => closeConnection());
}

export default connection;
