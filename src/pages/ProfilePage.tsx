import { UserButton } from '@clerk/clerk-react'; // Replace with the correct component
import { SpaceBackground } from '../components/SpaceBackground';

const ProfilePage = () => {
  return (
    <>
      <SpaceBackground />
      <div className="content-layer relative z-10 pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <UserButton />
        </div>
      </div>
    </>
  );
};

export { ProfilePage };
export default ProfilePage;
