import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, ListGroup, InputGroup } from 'react-bootstrap';

const API_URL = "http://127.0.0.1:5000/api";

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [additionalTasks, setAdditionalTasks] = useState([]);
    const [newTask, setNewTask] = useState("");

    const fetchTasks = async () => {
        const response = await axios.get(`${API_URL}/tasks`);
        setTasks(response.data);
    };

    const fetchAdditionalTasks = async () => {
        const response = await axios.get(`${API_URL}/additional-tasks`);
        setAdditionalTasks(response.data);
    };

    const addTask = async () => {
        if (newTask.trim()) {
            const response = await axios.post(`${API_URL}/tasks`, { title: newTask });
            setTasks([...tasks, response.data]);
            setNewTask("");
        }
    };

    const addAdditionalTaskToTasks = async (task) => {
        const response = await axios.post(`${API_URL}/tasks`, { title: task.title });
        setTasks([...tasks, response.data]);
        setAdditionalTasks(additionalTasks.filter(t => t.id !== task.id));
    };

    const updateTaskStatus = async (id, status) => {
        await axios.put(`${API_URL}/tasks/${id}`, { status });
        setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
    };

    const updateTaskTitle = async (id, newTitle) => {
        await axios.put(`${API_URL}/tasks/${id}`, { title: newTitle });
        setTasks(tasks.map(task => (task.id === id ? { ...task, title: newTitle } : task)));
    };

    const deleteTask = async (id) => {
        await axios.delete(`${API_URL}/tasks/${id}`);
        setTasks(tasks.filter(task => task.id !== id));
    };

    useEffect(() => {
        fetchTasks();
        fetchAdditionalTasks();
    }, []);

    return (
        <Container fluid className="bg-dark text-white d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '40px 0' }}>
            <h1 className="mb-4 text-center">Pengelola Tugas</h1>
            <Row className="mb-4 w-100" style={{ maxWidth: '600px' }}>
                <Col>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Tugas Baru"
                            className="bg-dark text-white"
                        />
                        <Button variant="success" onClick={addTask}>Tambah Tugas</Button>
                    </InputGroup>
                </Col>
            </Row>
            <h2 className="text-center mb-3">Tugas Saya</h2>
            <ListGroup className="mb-4 w-100" style={{ maxWidth: '600px' }}>
                {tasks.map(task => (
                    <ListGroup.Item key={task.id} className="bg-dark text-white d-flex align-items-center">
                        <Form.Control
                            type="text"
                            value={task.title}
                            onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                            className="bg-dark text-white flex-grow-1"
                        />
                        <Button variant="outline-success" className="ms-2" onClick={() => updateTaskStatus(task.id, 'selesai')}>Selesai</Button>
                        <Button variant="outline-danger" className="ms-2" onClick={() => deleteTask(task.id)}>Hapus</Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <h2 className="text-center mb-3">Saran Tugas Tambahan</h2>
            <ListGroup className="w-100" style={{ maxWidth: '600px' }}>
                {additionalTasks.map(task => (
                    <ListGroup.Item key={task.id} className="bg-dark text-white d-flex align-items-center">
                        <span className="flex-grow-1">{task.title} - {task.completed ? "Selesai" : "Belum Selesai"}</span>
                        <Button variant="outline-primary" onClick={() => addAdditionalTaskToTasks(task)}>Tambah ke Tugas Saya</Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}

export default TaskManager;
