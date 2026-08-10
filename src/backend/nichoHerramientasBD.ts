import mongo from "mongodb";
const url = 'mongodb+srv://kalconcepcion031_db_user:ZFpF40452pSzPIKC@cluster0.m7thjg7.mongodb.net/';
const client = new mongo.MongoClient(url);

async function connection(){
    try {
        const connection = await client.connect();
        return connection.db("InnovaTech Solutions");
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}
connection()
    .then(() => {
        console.log("Conexion exitosa a la base de datos InnovaTech Solutions.");
    })
    .catch(() => {
        process.exitCode = 1;
    })
    .finally(() => client.close());
export default connection;
