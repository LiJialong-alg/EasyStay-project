import React, { useState, useEffect } from 'react';
import { List, Rate, Tag, Button, Input, Select, Modal, message, Avatar, Space, Row, Col, Card, Statistic, Image, Spin } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined, StarFilled } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
// import * as echarts from 'echarts'; // Removed to prevent potential conflicts
import { getReviews, replyReview, toggleReviewHighlight } from '../../services/reviewService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      fetchReviews();
  }, []);

  const fetchReviews = async () => {
      setLoading(true);
      try {
          const res = await getReviews();
          const mapped = res.data.map(r => ({
              id: r.id,
              customer: r.customer_name,
              avatar: '', // Mock or add field later
              roomType: r.room_type_name || '标准间',
              rating: r.rating,
              content: r.content,
              images: [], // Mock or add field later
              date: dayjs(r.created_at).format('YYYY-MM-DD HH:mm'),
              reply: r.reply,
              isHighlight: r.is_highlight,
          }));
          setReviews(mapped);
      } catch (error) {
          // handled
      } finally {
          setLoading(false);
      }
  };

  const [filterRating, setFilterRating] = useState('all');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = (review) => {
    setCurrentReview(review);
    setReplyText(review.reply || '');
    setReplyModalVisible(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      message.error('回复内容不能为空');
      return;
    }
    try {
        await replyReview(currentReview.id, replyText);
        setReviews(reviews.map(r => r.id === currentReview.id ? { ...r, reply: replyText } : r));
        message.success('回复成功');
        setReplyModalVisible(false);
    } catch (error) {
        // handled
    }
  };

  const toggleHighlight = async (id) => {
    try {
        await toggleReviewHighlight(id);
        setReviews(reviews.map(r => r.id === id ? { ...r, isHighlight: !r.isHighlight } : r));
        message.success('操作成功');
    } catch (error) {
        // handled
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterRating === 'all') return true;
    if (filterRating === 'good') return r.rating >= 4;
    if (filterRating === 'medium') return r.rating === 3;
    if (filterRating === 'bad') return r.rating <= 2;
    return true;
  });

  // Radar Chart Option
  const radarOption = {
      radar: {
          indicator: [
              { name: '位置', max: 5 },
              { name: '房间', max: 5 },
              { name: '卫生', max: 5 },
              { name: '服务', max: 5 },
              { name: '价格', max: 5 }
          ],
          splitArea: { show: false },
          axisName: { color: '#64748b', fontFamily: 'Plus Jakarta Sans, serif' }
      },
      series: [{
          type: 'radar',
          data: [
              {
                  value: [4.8, 4.5, 4.9, 4.7, 4.6],
                  name: '综合评分',
                  areaStyle: { color: 'var(--brand-accent)', opacity: 0.2 },
                  lineStyle: { color: 'var(--brand-accent)' },
                  itemStyle: { color: 'var(--brand-accent)' }
              }
          ]
      }]
  };

  return (
    <div className="page-container fade-in">
      {/* Top Score Board */}
      <Card className="brand-card" style={{ marginBottom: 24 }}>
          <Row gutter={24} align="middle">
              <Col span={6} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 48, fontWeight: 'bold', color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>4.7</div>
                  <Rate disabled defaultValue={4.5} allowHalf style={{ color: 'var(--brand-accent)' }} />
                  <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>基于 1,234 条评价</div>
              </Col>
              <Col span={10} style={{ borderRight: '1px solid #f0f0f0' }}>
                  <ReactECharts option={radarOption} style={{ height: 200 }} />
              </Col>
              <Col span={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 24 }}>
                      <Button block onClick={() => setFilterRating('good')} className={filterRating === 'good' ? 'brand-btn-primary' : ''}>好评 (890)</Button>
                      <Button block onClick={() => setFilterRating('medium')} className={filterRating === 'medium' ? 'brand-btn-primary' : ''}>中评 (210)</Button>
                      <Button block onClick={() => setFilterRating('bad')} danger className={filterRating === 'bad' ? 'brand-btn-primary' : ''}>差评 (134)</Button>
                      <Button block onClick={() => setFilterRating('all')} type="link">查看全部</Button>
                  </div>
              </Col>
          </Row>
      </Card>

      {/* Review List */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
            <Input placeholder="搜索用户名" style={{ width: 200 }} className="brand-input" />
            <Select defaultValue="time" style={{ width: 120 }} className="brand-select">
                <Option value="time">按时间</Option>
                <Option value="rating">按评分</Option>
            </Select>
        </Space>
      </div>

      <List
        itemLayout="vertical"
        size="large"
        dataSource={filteredReviews}
        renderItem={item => (
          <List.Item
            key={item.id}
            className="brand-card"
            style={{ padding: 24, marginBottom: 16, borderRadius: 'var(--radius-md)', background: '#fff' }}
            actions={[
              <span onClick={() => toggleHighlight(item.id)} style={{ cursor: 'pointer', color: item.isHighlight ? 'var(--brand-accent)' : 'inherit' }}>
                {item.isHighlight ? <StarFilled /> : <StarFilled style={{ color: '#ccc' }} />} {item.isHighlight ? '已置顶' : '置顶'}
              </span>,
              <span onClick={() => handleReply(item)} style={{ cursor: 'pointer', color: 'var(--brand-primary)' }}>
                <MessageOutlined /> {item.reply ? '修改回复' : '回复'}
              </span>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} src={item.avatar} size={48} style={{ backgroundColor: 'var(--brand-primary)' }} />}
              title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                          <span style={{ fontWeight: 'bold', fontSize: 16, marginRight: 8, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>{item.customer}</span>
                          <Tag color="default" style={{ border: '1px solid var(--brand-border)', color: 'var(--text-secondary)' }}>{item.roomType}</Tag>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.date}</span>
                  </div>
              }
              description={<Rate disabled defaultValue={item.rating} style={{ fontSize: 14, color: 'var(--brand-accent)' }} />}
            />
            <div style={{ marginBottom: 16, color: 'var(--text-primary)', lineHeight: 1.6 }}>{item.content}</div>
            
            {item.images && item.images.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Image.PreviewGroup>
                        <Space>
                            {item.images.map((img, idx) => (
                                <Image key={idx} width={100} height={100} src={img} style={{ objectFit: 'cover', borderRadius: 8 }} />
                            ))}
                        </Space>
                    </Image.PreviewGroup>
                </div>
            )}

            {item.reply ? (
                <div style={{ background: 'var(--brand-bg-light)', padding: 16, borderRadius: 8, marginTop: 12, border: '1px solid var(--brand-border)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)' }}>商家回复：</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{item.reply}</div>
                </div>
            ) : (
                <div style={{ marginTop: 12 }}>
                    <Button type="dashed" size="small" onClick={() => handleReply(item)} style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}>快速回复</Button>
                </div>
            )}
          </List.Item>
        )}
      />

      <Modal
        title={<span className="font-serif brand-heading-sm">回复评价</span>}
        open={replyModalVisible}
        onOk={submitReply}
        onCancel={() => setReplyModalVisible(false)}
        okButtonProps={{ className: 'brand-btn-primary' }}
        cancelButtonProps={{ style: { borderRadius: 'var(--radius-sm)' } }}
        className="brand-modal"
      >
        <div style={{ marginBottom: 16, background: 'var(--brand-bg-light)', padding: 12, borderRadius: 4, border: '1px solid var(--brand-border)' }}>
            <div className="brand-text-primary font-serif"><strong>客户评价：</strong></div>
            <div className="brand-text-secondary">{currentReview?.content}</div>
        </div>
        <TextArea 
            rows={4} 
            value={replyText} 
            onChange={e => setReplyText(e.target.value)} 
            placeholder="请输入您的回复内容..." 
            className="brand-input"
        />
      </Modal>
    </div>
  );
};

export default Reviews;
