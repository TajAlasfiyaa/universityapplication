# University Application System with Supabase

This project is a university application system for Sudanese universities, integrated with Supabase for data persistence and authentication.

## Supabase Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)

2. Set up the database schema by running the SQL script in `supabase/schema.sql`
3. Get your Supabase URL and anon key from the project settings
4. Add the following environment variables to your project:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Features

- User authentication with phone number
- Persistent storage of application data
- Storing preferences for bachelor's and diploma programs
- Tracking application status

## Database Schema

The database consists of three main tables:

1. **users**: Stores basic user information
   - id: UUID (primary key)
   - email: TEXT (optional)
   - phone: TEXT
   - created_at: TIMESTAMP

2. **applications**: Stores application details
   - id: UUID (primary key)
   - user_id: UUID (foreign key to users)
   - exam_number: TEXT
   - track: TEXT
   - form_number: TEXT
   - state: TEXT
   - name: TEXT
   - school: TEXT
   - phone_number: TEXT
   - nationality: TEXT
   - country: TEXT (optional)
   - receive_sms: BOOLEAN
   - has_resignation: BOOLEAN
   - national_id: TEXT
   - gender: TEXT
   - application_type: TEXT
   - agreed: BOOLEAN
   - created_at: TIMESTAMP
   - updated_at: TIMESTAMP

3. **preferences**: Stores university and faculty preferences
   - id: UUID (primary key)
   - application_id: UUID (foreign key to applications)
   - university: TEXT
   - university_name: TEXT
   - faculty: TEXT
   - faculty_name: TEXT
   - type: TEXT (bachelor or diploma)
   - order: INTEGER
   - created_at: TIMESTAMP

## How It Works

1. When a user logs in with their exam number, the system checks if an application already exists
2. If an application exists, it loads the data from Supabase
3. If no application exists, it creates a new user and application record
4. As the user progresses through the application steps, the data is stored locally
5. When the user submits the application, all data is saved to Supabase
6. The user can return later and continue from where they left off

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only view and update their own data
- The application uses the Supabase anon key for public operations

