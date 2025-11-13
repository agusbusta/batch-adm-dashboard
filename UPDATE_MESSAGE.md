# Frontend Update - Job Queue & Client Management Improvements

Hey team! 👋

Quick update on the latest frontend improvements:

**Job Queue Enhancements:**
- Implemented drag-and-drop reordering for job priorities in the GPU Resources queue
- You can now drag jobs by the handle icon to reorder them visually (like a staircase)
- Priorities automatically update while maintaining the original range (90-100)
- Fixed the "Edit" button that was incorrectly navigating to job detail instead of allowing inline editing

**Client Management Improvements:**
- Fixed the client edit modal that was showing a blank screen
- Reduced modal overlay opacity for better visibility of background content
- Removed redundant "Edit" button from the clients table (edit is available in the detail view)
- Auto-navigation to Credits tab when clicking "Credits" from the clients list

**Technical Details:**
- Drag-and-drop uses native HTML5 API (no additional dependencies)
- Priority updates are batched and sent to the API after reordering
- Improved error handling with automatic rollback on failed priority updates
- Better event propagation handling to prevent unwanted navigation

All changes are backward compatible and ready for testing. The job queue reordering is particularly useful for managing processing order without manually editing priority numbers.

Let me know if you'd like to see a demo or have any questions!

