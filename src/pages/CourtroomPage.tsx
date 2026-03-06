import { useSearchParams } from 'react-router-dom';
import { CourtroomProvider } from '@/context/CourtroomContext';
import TopBar from '@/components/courtroom/TopBar';
import ParticipantsPanel from '@/components/courtroom/ParticipantsPanel';
import EvidenceChatPanel from '@/components/courtroom/EvidenceChatPanel';
import BottomControlBar from '@/components/courtroom/BottomControlBar';
import JudgeControlPanel from '@/components/courtroom/JudgeControlPanel';
import CourtroomScene from '@/components/courtroom/CourtroomScene';
import { Role } from '@/types/courtroom';

const CourtroomPage = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as Role) || 'observer';

  return (
    <CourtroomProvider role={role}>
      <div className="h-screen w-screen overflow-hidden bg-background relative">
        <TopBar />
        <CourtroomScene />
        <ParticipantsPanel />
        <EvidenceChatPanel />
        <JudgeControlPanel />
        <BottomControlBar />
      </div>
    </CourtroomProvider>
  );
};

export default CourtroomPage;
