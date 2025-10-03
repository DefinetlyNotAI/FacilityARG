import { useEffect, useState } from 'react';
import { RootPage } from './pages/RootPage';
import {DayPage} from "./DayPage.tsx";

function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    if (currentPath.startsWith('/day/')) {
        return <DayPage/>;
    }

    return <RootPage />;
}

export default App;
