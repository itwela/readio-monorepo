import { SignIn } from '@clerk/nextjs';
import ReadioHeading from '@/app/readio-components/essentials/readio-heading';
const SignInPage = () => {
  return (
    <>

        <div className="h-[100dvh] w-[100dvw] flex place-items-center place-content-center flex-col">
          <ReadioHeading/>
        <div className='h-[100dvh] flex place-items-center place-content-center scale-[80%] md:scale-[100%] '>
          <SignIn/>
        </div>
      </div>

    </>
  );
};
export default SignInPage;