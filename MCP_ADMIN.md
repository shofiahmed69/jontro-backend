# Jontro Admin MCP

This backend now includes a local stdio MCP server for admin management tasks.

## Run

```bash
npm run mcp:admin
```

The server uses the same `.env` values as the backend app, especially `DATABASE_URL`.

## Tools

- `admin_get_dashboard`
- `admin_list_leads`
- `admin_update_lead`
- `admin_delete_lead`
- `admin_list_projects`
- `admin_create_project`
- `admin_update_project`
- `admin_toggle_project_flag`
- `admin_delete_project`
- `admin_list_blog_posts`
- `admin_create_blog_post`
- `admin_update_blog_post`
- `admin_delete_blog_post`
- `admin_list_team_members`
- `admin_list_admin_users`
- `admin_list_reports`
- `admin_review_report`
- `admin_get_settings`
- `admin_update_settings`

## Example MCP Client Config

```json
{
  "mcpServers": {
    "jontro-admin": {
      "command": "npm",
      "args": ["run", "mcp:admin"],
      "cwd": "/home/alvee/Desktop/jantra full stack '/jontro-backend"
    }
  }
}
```

## Notes

- `admin_review_report` needs a valid admin user ID as `reviewerId`.
- The MCP server talks directly to the project database through Prisma.
- This is a local admin control surface. It should only be exposed to trusted operators.
