package models

type User struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type DirectoryStructure struct {
	Email     string `json:"email"`
	Structure string `json:"structure"`
}

type VnObject struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	IsFile     bool   `json:"isFile"`
	Contents   string `json:"contents"`
	UpdateDate string `json:"updateDate"`
	Public     bool   `json:"public"`
}

type Image struct {
	Id          string `json:"id"`
	Email       string `json:"email"`
	ContentType string `json:"contentType"`
	BinaryData  []byte `json:"binaryData"`
}

type UserData struct {
	Username string
	Name     string
	Avatar   string
	Email    string
}

type DataResponse struct {
	Message    *string
	StatusCode int
	Data       *string
}

type ErrorMessage struct {
	Message    string
	StatusCode int
}

type CreatedObjects struct {
	ObjectLocation string `json:"objectLocation"`
	Uuid           string `json:"uuid"`
	Name           string `json:"name"`
	IsFile         bool   `json:"isFile"`
}

type DeletedObjects struct {
	ObjectLocation string `json:"objectLocation"`
	Uuid           string `json:"uuid"`
}

type MovedObjects struct {
	OldLocation string  `json:"oldLocation"`
	NewLocation string  `json:"newLocation"`
	Uuid        string  `json:"uui"`
	Name        string  `json:"name"`
	IsFile      bool    `json:"isFile"`
	Contents    *string `json:"contents"`
	Public      bool    `json:"public"`
}

type DirectoryChanges struct {
	Created []CreatedObjects `json:"created"`
	Deleted []DeletedObjects `json:"deleted"`
	Moved   []MovedObjects   `json:"moved"`
}
