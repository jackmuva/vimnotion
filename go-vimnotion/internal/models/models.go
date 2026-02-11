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
	Email      string `json:"email"`
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
	OldLocation string `json:"oldLocation"`
	NewLocation string `json:"newLocation"`
	Uuid        string `json:"uuid"`
	Name        string `json:"name"`
	IsFile      bool   `json:"isFile"`
}

type DirectoryChanges struct {
	Created []CreatedObjects `json:"created"`
	Deleted []DeletedObjects `json:"deleted"`
	Moved   []MovedObjects   `json:"moved"`
}

type ImageReference struct {
	ImageId    string `json:"imageId"`
	VnObjectId string `json:"vnObjectId"`
}

type ChatSession struct {
	SessionId  string      `json:"sessionId"`
	Messages   []AiMessage `json:"messages"`
	Summary    string      `json:"summary"`
	UpdateDate string      `json:"updateDate"`
	Email      string      `json:"email"`
}

type ChatFile struct {
	FileId       string `json:"fileId"`
	FileName     string `json:"fileName"`
	FileContents string `json:"fileContents"`
	Email        string `json:"email"`
	SessionId    string `json:"sessionId"`
}

type Suggestion struct {
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	OldString string `json:"oldString"`
	NewString string `json:"newString"`
}
