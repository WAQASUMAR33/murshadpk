'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

// MUI Imports
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField, // Added TextField import
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [statsData, setStatsData] = useState(null);
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchData = async (startDate, endDate) => {
    try {
      const date1 = startDate.toISOString().split('T')[0];
      const date2 = endDate.toISOString().split('T')[0];

      const response = await fetch('/api/dashboard/allorders', {
        method: 'POST',
        body: JSON.stringify({ date1, date2 }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatsData(result.data);

        const salesLabels = [];
        const pendingAmounts = [];
        const paidAmounts = [];
        const shippedAmounts = [];
        const completedAmounts = [];
        const cancelledAmounts = [];

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          salesLabels.push(
            currentDate.toLocaleDateString('default', {
              month: 'short',
              day: 'numeric',
            })
          );

          const totalPending = result.data.pending?.amount || 0;
          const totalPaid = result.data.paid?.amount || 0;
          const totalShipped = result.data.shipped?.amount || 0;
          const totalCompleted = result.data.completed?.amount || 0;
          const totalCancelled = result.data.cancelled?.amount || 0;

          pendingAmounts.push(totalPending);
          paidAmounts.push(totalPaid);
          shippedAmounts.push(totalShipped);
          completedAmounts.push(totalCompleted);
          cancelledAmounts.push(totalCancelled);

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setSalesData({
          labels: salesLabels,
          datasets: [
            {
              label: 'Pending',
              data: pendingAmounts,
              borderColor: '#FBBF24',
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
            },
            {
              label: 'Paid',
              data: paidAmounts,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
            },
            {
              label: 'Shipped',
              data: shippedAmounts,
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
            },
            {
              label: 'Completed',
              data: completedAmounts,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
            },
            {
              label: 'Cancelled',
              data: cancelledAmounts,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
            },
          ],
        });
      } else {
        console.error('Failed to fetch data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]); // Added dependency array to refetch on date change

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  };

  const stats = useMemo(() => {
    if (!statsData) return [];

    return [
      {
        label: 'Pending Orders',
        value: statsData.pending?.count || 0, // Safe access
        amount: statsData.pending?.amount || 0,
        icon: <InventoryIcon sx={{ fontSize: 28 }} />,
        color: '#FBBF24',
      },
      {
        label: 'Paid Orders',
        value: statsData.paid?.count || 0,
        amount: statsData.paid?.amount || 0,
        icon: <PaymentIcon sx={{ fontSize: 28 }} />,
        color: '#3B82F6',
      },
      {
        label: 'Shipped Orders',
        value: statsData.shipped?.count || 0,
        amount: statsData.shipped?.amount || 0,
        icon: <LocalShippingIcon sx={{ fontSize: 28 }} />,
        color: '#6366F1',
      },
      {
        label: 'Completed Orders',
        value: statsData.completed?.count || 0,
        amount: statsData.completed?.amount || 0,
        icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
        color: '#10B981',
      },
      {
        label: 'Cancelled Orders',
        value: statsData.cancelled?.count || 0,
        amount: statsData.cancelled?.amount || 0,
        icon: <CancelIcon sx={{ fontSize: 28 }} />,
        color: '#EF4444',
      },
    ];
  }, [statsData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: 'Sales by Status',
        font: {
          family: 'Inter, sans-serif',
          size: 18,
        },
      },
    },
  };

  return (
    <Box sx={{ pt: 3, minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Container maxWidth="lg" sx={{ px: 3 }}>
        {/* Date Filter Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: { md: 'space-between' },
            alignItems: 'center',
            mb: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start date"
              customInput={<TextField variant="outlined" size="small" sx={{ minWidth: 150 }} />}
            />
            <Typography>-</Typography>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End date"
              customInput={<TextField variant="outlined" size="small" sx={{ minWidth: 150 }} />}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleFilter}
              sx={{ px: 3, py: 1 }}
            >
              Filter
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats.length > 0 ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}> {/* Adjusted md={4} for 3-column layout */}
                <Card
                  sx={{
                    p: 2,
                    '&:hover': { boxShadow: 6 },
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      sx={{ bgcolor: stat.color, color: 'white', mr: 2, p: 2 }}
                    >
                      {stat.icon}
                    </IconButton>
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stat.value} Orders
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Amount: {stat.amount.toLocaleString()} Rs.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>Loading stats...</Typography>
        )}

        {/* Sales Chart */}
        <Paper sx={{ p: 3, boxShadow: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Sales Overview
          </Typography>
          <Line data={salesData} options={options} />
        </Paper>
      </Container>
    </Box>
  );
}