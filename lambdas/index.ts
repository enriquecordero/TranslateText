export const handler = async ()=> {
    const now = new Date(Date.now()).toString();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `Hello, the current time is ${now}` })

    }
}