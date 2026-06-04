# Final Phase Frontend Test

## Landing Page
- Open `/`.
- Confirm only published blogs are visible and the page loads the latest six items.
- Use the search box and confirm it routes to `/blogs?search=...`.
- Check the primary CTA opens `/blogs` and the secondary CTA opens `/write` for readers.

## Blog Filters
- Open `/blogs`.
- Search, choose a category, choose a tag, and paginate.
- Confirm empty and backend-offline states are readable.
- Confirm cards show excerpts, category, tags, reading time, and comment count when returned.

## Blog Cover Upload
- Open `/write`.
- Upload JPEG, PNG, and WebP cover images under 5MB.
- Confirm invalid file type and over-5MB files show errors.
- Confirm the form cannot submit while upload is running.
- Save a draft and verify `coverImage` and `coverImagePublicId` are sent.
- Repeat on `/my-blogs/:id/edit` and `/editor/blogs/:id/edit`.

## Profile Avatar Upload
- Open `/profile`.
- Upload a JPEG, PNG, or WebP avatar under 2MB.
- Confirm invalid files are rejected.
- Save and confirm the avatar appears in the navbar, profile page, author card, and comments when returned by the API.

## Comments
- Open a published blog at `/blogs/:slug`.
- Anonymous users should see a login prompt.
- Logged-in users can post a non-empty comment up to 1000 characters.
- Failed submit should keep the typed comment.
- Confirm pagination, empty state, loading state, and delete-own-comment behavior if supported by the backend.

## Comment Moderation
- Open `/admin/comments`.
- Search, filter by status, and paginate.
- Hide, restore, and delete comments with confirmation dialogs.
- Confirm backend errors display as toast messages.

## Category Management
- Open `/admin/categories`.
- Search, create, edit, activate/deactivate, delete, and paginate.
- Confirm duplicate names are blocked on the current page.
- Confirm delete failures suggest deactivation.

## Tag Management
- Open `/admin/tags`.
- Search, create, edit, activate/deactivate, delete, and paginate.
- In `/write`, select up to five tags and confirm duplicates are not possible.
- Confirm a sixth tag selection shows an error.

## Mobile Responsiveness
- Test `/`, `/blogs`, `/blogs/:slug`, `/write`, `/profile`, `/admin/categories`, `/admin/tags`, and `/admin/comments` at mobile widths.
- Confirm no horizontal page scroll, table overflow, or overlapping controls.

## Dashboard Speed
- Visit user, editor, and admin dashboards.
- Confirm each dashboard uses its summary request rather than many repeated stats calls.
- Navigate between private pages and confirm `/auth/me` is not repeatedly requested beyond session refresh needs.
