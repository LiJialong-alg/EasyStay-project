import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/userSlice';
import { getMe } from '../services/authService';
import { getAnnouncements } from '../services/announcementService';
import { Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getMe();
        const user = res.data?.user || null;
        if (!user) throw new Error('invalid user');
        if (cancelled) return;
        dispatch(login({ userInfo: user, token, role: user.role || '' }));
        const key = `last_announcement_seen_${user.role || 'all'}`;
        const annRes = await getAnnouncements({ role: user.role || 'all', status: 'published' });
        const latest = Array.isArray(annRes.data) ? annRes.data[0] : null;
        if (latest && String(latest.id) !== String(localStorage.getItem(key) || '')) {
          localStorage.setItem(key, String(latest.id));
          notification.open({
            message: latest.title || '公告',
            description: (latest.content || '').slice(0, 90) + ((latest.content || '').length > 90 ? '…' : ''),
            placement: 'topRight',
            duration: 8,
            btn: (
              <Button
                size="small"
                type="primary"
                style={{ background: '#0f172a', borderColor: '#0f172a' }}
                onClick={() => {
                  notification.destroy();
                  navigate(user.role === 'admin' ? '/admin/system/announcement' : '/merchant/dashboard');
                }}
              >
                查看
              </Button>
            ),
          });
        }
      } catch {
        if (cancelled) return;
        dispatch(logout());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, navigate, token]);

  return children;
};

export default AuthBootstrap;
