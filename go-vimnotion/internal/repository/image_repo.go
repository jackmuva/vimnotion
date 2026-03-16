package repository

import (
	"database/sql"
	"fmt"
	"os"

	"vimnotion.com/server/internal/models"
)

func GetImageById(db *sql.DB, id string) ([]models.Image, error) {
	rows, err := db.Query("SELECT * FROM Image WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
	}
	defer rows.Close()

	var images []models.Image

	for rows.Next() {
		var image models.Image
		if err := rows.Scan(&image.Id, &image.Email, &image.ContentType, &image.BinaryData); err != nil {
			fmt.Println("Error scanning row:", err)
		}
		images = append(images, image)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return images, nil
}

func InsertImage(db *sql.DB, image models.Image) error {
	_, err := db.Exec("INSERT INTO Image(id, email, contentType, binaryData) VALUES(?, ?, ?, ? )",
		image.Id, image.Email, image.ContentType, image.BinaryData)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func DeleteImage(db *sql.DB, id string) error {
	_, err := db.Exec("DELETE FROM Image WHERE id=?", id)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}

func GetImageReferenceByVnObject(db *sql.DB, objectId string) ([]models.ImageReference, error) {
	rows, err := db.Query("SELECT * FROM ImageReference WHERE vnObjectId=?", objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var imageReferences []models.ImageReference

	for rows.Next() {
		var imageReference models.ImageReference

		if err := rows.Scan(&imageReference.ImageId, &imageReference.VnObjectId); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}

		imageReferences = append(imageReferences, imageReference)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	return imageReferences, nil
}

func GetImageReferenceCount(db *sql.DB, imageId string) (*struct{ Count int }, error) {
	rows, err := db.Query("SELECT COUNT(*) as Count FROM ImageReference WHERE imageId=?", imageId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var countRows []struct{ Count int }

	for rows.Next() {
		var countRow struct{ Count int }

		if err := rows.Scan(&countRow.Count); err != nil {
			fmt.Println("Error scanning row:", err)
		}

		countRows = append(countRows, countRow)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error during rows iteration:", err)
		return nil, err
	}
	if len(countRows) == 0 {
		fmt.Println("Error: No count available")
		return nil, fmt.Errorf("Error: No count available")
	}
	return &countRows[0], nil
}

func InsertImageReference(db *sql.DB, imageId string, objectId string) error {
	_, err := db.Exec("INSERT INTO ImageReference(imageId, vnObjectId) VALUES(?, ?)", imageId, objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute insert: %v\n", err)
		return err
	}
	return nil
}

func DeleteImageReference(db *sql.DB, imageId string, objectId string) error {
	_, err := db.Exec("DELETE FROM ImageReference WHERE imageId=? AND vnObjectId=?", imageId, objectId)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute delete: %v\n", err)
		return err
	}
	return nil
}
