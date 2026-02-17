import React, { useEffect, useState } from "react";
import { Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/api/admin/users"/*, { headers: ... if using auth */)
      .then(res => setUsers(res.data)).catch(() => {});
  }, []);
  return (
    <Paper sx={{ p: 4, mt: 6 }}>
      <Typography variant="h6" mb={2}>All Users</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell><TableCell>Email</TableCell>
            <TableCell>Name</TableCell><TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
