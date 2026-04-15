import React, { useEffect, useState } from 'react';
import { UserService } from '../../services/user.service';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Button } from '@mui/material';

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'users' | 'logs'>('users');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (tab === 'users') {
                    const data = await UserService.getUsers();
                    setUsers(data);
                } else {
                    const data = await UserService.getAllLogs();
                    setLogs(data);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [tab]);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
            <Typography variant="h4" className="font-bold text-slate-800 dark:text-white">
                Access Control & User Registry
            </Typography>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                <button
                    onClick={() => setTab('users')}
                    className={`font-semibold pb-2 ${tab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Users & Roles
                </button>
                <button
                    onClick={() => setTab('logs')}
                    className={`font-semibold pb-2 ${tab === 'logs' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    System Activity Logs
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <CircularProgress />
                </div>
            ) : tab === 'users' ? (
                <TableContainer component={Paper} className="shadow-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <Table>
                        <TableHead className="bg-slate-50 dark:bg-slate-800">
                            <TableRow>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Email</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Name</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Role</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Status</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Actions</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u: any) => (
                                <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell className="text-slate-800 dark:text-slate-200">{u.email}</TableCell>
                                    <TableCell className="text-slate-800 dark:text-slate-200">{u.full_name || '—'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={u.role || 'client'} 
                                            size="small"
                                            className="uppercase text-[10px] font-bold"
                                            color={u.role === 'admin' || u.role === 'superuser' ? 'secondary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {u.is_active ? 
                                            <span className="text-emerald-500 font-bold text-xs uppercase">Active</span> : 
                                            <span className="text-slate-400 font-bold text-xs uppercase">Inactive</span>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" color="primary">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <TableContainer component={Paper} className="shadow-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <Table>
                        <TableHead className="bg-slate-50 dark:bg-slate-800">
                            <TableRow>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Timestamp</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">User</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Action</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">Resource</span></TableCell>
                                <TableCell><span className="font-bold text-slate-600 dark:text-slate-300">IP Addr</span></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log: any) => (
                                <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell className="text-slate-500 text-xs">
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {log.user?.full_name || log.user?.email || 'Unknown'}
                                            </span>
                                            {log.user?.full_name && <span className="text-xs text-slate-400">{log.user.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={log.action} size="small" className="bg-blue-100 text-blue-800 font-bold text-[10px] uppercase" />
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 dark:text-slate-300">{log.resource || '—'}</TableCell>
                                    <TableCell className="text-xs text-slate-400">{log.ip_address || '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default AdminUsers;
