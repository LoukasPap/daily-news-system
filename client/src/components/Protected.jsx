import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            console.log(token)

            try {
                const response = await fetch(`${window.myGlobalVariable}/verify-token/${token}`);

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }

            } catch (error) {
                localStorage.removeItem('token');
                navigate('/');
            }
        };

        verifyToken();
    }, [navigate]);

    return <div> Protected page!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! You are A U T HE N T I C A T E D</div>
}

export default ProtectedPage;