import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ReloadOutlined } from '@ant-design/icons';

const Captcha = forwardRef(({ onSuccess, onFail }, ref) => {
  const canvasRef = useRef(null);
  const [code, setCode] = useState('');

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let newCode = '';
    for (let i = 0; i < 4; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(newCode);
    drawCaptcha(newCode);
  };

  useImperativeHandle(ref, () => ({
    validate: (input) => {
      if (input.toLowerCase() === code.toLowerCase()) {
        return true;
      }
      generateCode();
      return false;
    }
  }));

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Add some noise
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = getRandomColor();
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = getRandomColor();
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw rotated characters
    const charWidth = canvas.width / 4;
    for (let i = 0; i < 4; i++) {
        ctx.save();
        const x = charWidth * i + charWidth / 2;
        const y = canvas.height / 2;
        const angle = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25 radians
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = getRandomColor();
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    generateCode();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={generateCode} title="Click to refresh">
      <canvas ref={canvasRef} width={100} height={40} style={{ borderRadius: '4px', marginRight: '8px' }} />
    </div>
  );
});

export default Captcha;
