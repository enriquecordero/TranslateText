import { TranslateClient, TranslateTextCommand, TranslateTextCommandOutput } from "@aws-sdk/client-translate";
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";

const translateClient = new TranslateClient({});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.log('Event:', JSON.stringify(event));

    try {
        if (!event.body) {
            throw new Error('No body was found in the request');
        }

        const body = JSON.parse(event.body);
        console.log('Body:', body);

        const { SourceLanguageCode, TargetLanguageCode, Text } = body;

        if (!SourceLanguageCode || !TargetLanguageCode || !Text) {
            throw new Error('Missing required parameters');
        }

        const translateCmd = new TranslateTextCommand({
            SourceLanguageCode,
            TargetLanguageCode,
            Text,
        });

        const result: TranslateTextCommandOutput = await translateClient.send(translateCmd);
        console.log('Translation result:', result.TranslatedText);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store"
            },
            body: JSON.stringify({ 
                message: `La traducción de ${Text} en el lenguaje ${SourceLanguageCode.toUpperCase()} es : ${result.TranslatedText} en el lenguaje ${TargetLanguageCode.toUpperCase()} `,
            })              
            
        };
    } catch (err) {
        console.error('Error in Lambda function:', err);
        
        return {
            statusCode: err instanceof Error && err.message.includes('No body was found') ? 400 : 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: "An error occurred during translation",
                error: err instanceof Error ? err.message : String(err),
                timestamp: new Date().toISOString()
            })
        };
    }
};
