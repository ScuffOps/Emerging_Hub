# VTuber Portfolio API Contracts

## 1. Character Profile
- **GET /api/character**
  - **Description**: Returns the single character profile data (Veri).
  - **Response**: `CharacterProfile` object containing lore, skills, colors, relationships, pets, etc.

- **PUT /api/character**
  - **Description**: Updates the character profile.
  - **Body**: `CharacterProfileUpdate` object.
  - **Response**: `CharacterProfile` object.

## 2. Art Gallery
- **GET /api/gallery**
  - **Description**: Returns all gallery items.
  - **Query**: `?category=string&folder=string`
  - **Response**: `List[GalleryItem]`

- **POST /api/gallery**
  - **Description**: Creates a new gallery item.
  - **Body**: `GalleryItemCreate`
  - **Response**: `GalleryItem`

- **PUT /api/gallery/{id}**
  - **Description**: Updates an existing gallery item.
  - **Body**: `GalleryItemUpdate`
  - **Response**: `GalleryItem`

- **DELETE /api/gallery/{id}**
  - **Description**: Deletes a gallery item (soft delete in DB).
  - **Response**: `{"status": "deleted"}`

## 3. Brand Library
- **GET /api/brand**
  - **Description**: Returns all brand assets.
  - **Response**: `List[BrandAsset]`

- **POST /api/brand**
  - **Description**: Creates a new brand asset.
  - **Body**: `BrandAssetCreate`
  - **Response**: `BrandAsset`

- **DELETE /api/brand/{id}**
  - **Description**: Deletes a brand asset.

## 4. Licenses
- **GET /api/licenses**
  - **Description**: Returns all licenses.
  - **Response**: `List[License]`

- **POST /api/licenses**
  - **Description**: Creates a new license.
  - **Body**: `LicenseCreate`
  - **Response**: `License`

- **DELETE /api/licenses/{id}**
  - **Description**: Deletes a license.

## 5. Debut Assets (Protected)
- **POST /api/auth/verify-debut**
  - **Description**: Verifies debut password and returns a session token.
  - **Body**: `{"password": "..."}`
  - **Response**: `{"token": "..."}`

- **GET /api/debut**
  - **Description**: Returns debut assets. Requires Authorization token.
  - **Header**: `Authorization: Bearer <token>`
  - **Response**: `List[DebutAsset]`

- **POST /api/debut**
  - **Description**: Creates a new debut asset.
  - **Body**: `DebutAssetCreate`
  - **Response**: `DebutAsset`

## 6. File Uploads (Chunked / Direct)
- **POST /api/upload**
  - **Description**: Uploads a file (thumbnail, high-res image, etc.) directly to the object storage.
  - **Body**: `multipart/form-data` with `file`
  - **Response**: `{"id": "...", "url": "..."}`

- **GET /api/files/{id}**
  - **Description**: Serves the uploaded file.
  - **Response**: The file binary content.
