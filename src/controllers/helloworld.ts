import { Get, Route } from 'tsoa';

interface HelloWorldResponse {
    message: string;
}

@Route('helloworld')
export default class HelloWorldController {
    @Get('/')
    public async getMessage(): Promise<HelloWorldResponse> {
        return {
            message: 'Goodbye, moon!',
        };
    }
}
