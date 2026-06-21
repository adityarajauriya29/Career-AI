# MongoDB Database Design

## Collections

### users
| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | PK |
| name | string | required |
| email | string | unique index |
| password | string | bcrypt hash |
| role | string | student | mentor | placement_officer | admin |
| created_at | datetime | |

Index: `{email:1}` unique.

### profiles
| Field | Type | Notes |
|-------|------|-------|
| user_id | string | FK→users._id, unique index |
| branch | string | |
| year | int | 1–5 |
| cgpa | float | |
| skills | [string] | |
| certifications | [string] | |
| projects | [object] | |
| interests | [string] | |
| target_role | string | |
| weekly_study_hours | int | |
| latest_gap | object | cached gap result |
| last_resume_parse | object | last parsed resume snapshot |

Index: `{user_id:1}` unique.

### career_roles
| Field | Type |
|-------|------|
| name | string (unique) |
| description | string |
| required_skills | [string] |
| difficulty | string |
| duration_months | int |
| recommended_projects | [string] |

### roadmaps
| Field | Type |
|-------|------|
| user_id | string |
| target_role | string |
| level | string |
| months | [object] |
| resources | object |
| gap | object |
| created_at | datetime |

Index: `{user_id:1}`.

### progress
| Field | Type |
|-------|------|
| user_id | string |
| skill | string |
| completed | bool |
| updated_at | datetime |

Compound index: `{user_id:1, skill:1}` unique.

### mentor_suggestions
- student_id, mentor_id, text, created_at

### chat_history
- user_id, question, answer, created_at

## Relationships
- users (1) — (1) profiles
- users (1) — (1) roadmaps
- users (1) — (n) progress, chat_history, mentor_suggestions
- career_roles (1) — (n) roadmaps (via target_role)
