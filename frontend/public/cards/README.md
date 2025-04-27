# Dixit Card Images

For the real Dixit card experience, replace the placeholder images with actual Dixit card images:

1. Rename your 108 Dixit card images to follow the pattern: `card1.jpg`, `card2.jpg`, `card3.jpg`, ..., `card108.jpg`
2. Place all these files in this directory (`frontend/public/cards/`)
3. The server will automatically select random cards from the full set of 108 cards

## Image Requirements

- Images should ideally be JPG or WebP format for better performance
- Recommended resolution: 300-500px width for good quality without excessive file size
- Keep file sizes under 200KB per image for better performance
- Use consistent aspect ratio (typically 2:3) for all cards

## Image Naming Convention

Cards must follow the naming pattern: `card{number}.jpg` (e.g., card1.jpg, card2.jpg, etc.)

The backend code references these card filenames when dealing hands and tracking played cards.

## Legal Notice

If you're using official Dixit card images, ensure you have the proper rights/licenses to use them. The images are copyrighted by Libellud and should only be used for personal, non-commercial purposes. 