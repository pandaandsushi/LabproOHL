class Film {
    constructor(id, title, description, director, releaseYear, genre, price, duration, coverImage, video, createdAt, updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.director = director;
        this.releaseYear = releaseYear;
        this.genre = genre;
        this.price = price;
        this.duration = duration;
        this.coverImage = coverImage;
        this.video = video;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
export default Film;