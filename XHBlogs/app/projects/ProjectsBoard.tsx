"use client";
import ResourceLibrary from '../resources/ResourceLibrary';
import { projectsData } from '../../data/projects';
const initialItems = projectsData.map(project => ({ id: project.id, title: project.name, url: '', category: project.tags.join(' · ') || 'Uncategorized', note: project.description }));
export default function ProjectsBoard() { return <ResourceLibrary projectMode initialItems={initialItems}/>; }
