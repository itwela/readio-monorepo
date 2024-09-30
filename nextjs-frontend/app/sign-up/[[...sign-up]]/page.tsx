import { SignUp } from '@clerk/nextjs';
import ReadioHeading from '../../readio-components/essentials/readio-heading';

const SignInPage = () => {
  return (
    <>

        <div className="h-[100dvh] w-[100dvw] flex place-items-center place-content-center flex-col">
          <ReadioHeading/>
        <div className='h-[70dvh] scale-[80%] md:scale-[100%] '>
        <SignUp/>
        </div>
      </div>

    </>
  );
};
export default SignInPage;