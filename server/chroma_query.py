from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    payload = json.load(sys.stdin)
    question = str(payload.get("question", "")).strip()
    documents = payload.get("documents", [])
    try:
        import chromadb

        client = chromadb.PersistentClient(path=str(Path.cwd() / ".chroma"))
        collection = client.get_or_create_collection(name="campusos_knowledge")
        if documents:
            collection.upsert(
                ids=[item["id"] for item in documents],
                documents=[f'{item["title"]}\n{item["content"]}' for item in documents],
                metadatas=[
                    {
                        "title": item["title"],
                        "sourceUrl": item["sourceUrl"],
                        "sourceLabel": item["sourceLabel"],
                    }
                    for item in documents
                ],
            )
        result = collection.query(
            query_texts=[question],
            n_results=min(5, max(1, len(documents))),
            include=["documents", "metadatas", "distances"],
        )
        records = []
        for index, content in enumerate((result.get("documents") or [[]])[0] or []):
            metadata = ((result.get("metadatas") or [[]])[0] or [{}])[index]
            distance = ((result.get("distances") or [[]])[0] or [None])[index]
            records.append(
                {
                    "id": next(
                        (
                            item["id"]
                            for item in documents
                            if item["title"] == metadata.get("title")
                        ),
                        metadata.get("title", f"chroma-{index}"),
                    ),
                    "title": metadata.get("title", "Campus source"),
                    "content": content,
                    "sourceUrl": metadata.get("sourceUrl", ""),
                    "sourceLabel": metadata.get("sourceLabel", "Campus source"),
                    "distance": distance,
                }
            )
        print(json.dumps({"documents": records}))
    except Exception as error:
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    main()